package main

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"net"
)

// encodeLength mengubah panjang word menjadi prefix sesuai spesifikasi API RouterOS.
func encodeLength(l int) []byte {
	switch {
	case l < 0x80:
		return []byte{byte(l)}
	case l < 0x4000:
		l |= 0x8000
		return []byte{byte(l >> 8), byte(l)}
	case l < 0x200000:
		l |= 0xC00000
		return []byte{byte(l >> 16), byte(l >> 8), byte(l)}
	case l < 0x10000000:
		l |= 0xE0000000
		return []byte{byte(l >> 24), byte(l >> 16), byte(l >> 8), byte(l)}
	default:
		return []byte{0xF0, byte(l >> 24), byte(l >> 16), byte(l >> 8), byte(l)}
	}
}

// writeSentence mengirim satu "sentence" (kumpulan word) diakhiri word kosong.
func writeSentence(w *bufio.Writer, words ...string) error {
	for _, word := range words {
		if _, err := w.Write(encodeLength(len(word))); err != nil {
			return err
		}
		if _, err := w.WriteString(word); err != nil {
			return err
		}
	}
	_, err := w.Write([]byte{0}) // word kosong = penutup sentence
	if err != nil {
		return err
	}
	return w.Flush()
}

// readLength membaca prefix panjang word berikutnya dari stream.
func readLength(r *bufio.Reader) (int, error) {
	b0, err := r.ReadByte()
	if err != nil {
		return 0, err
	}
	switch {
	case b0&0x80 == 0x00:
		return int(b0), nil
	case b0&0xC0 == 0x80:
		b1, err := r.ReadByte()
		if err != nil {
			return 0, err
		}
		return int(b0&0x3F)<<8 | int(b1), nil
	case b0&0xE0 == 0xC0:
		buf := make([]byte, 2)
		if _, err := io.ReadFull(r, buf); err != nil {
			return 0, err
		}
		return int(b0&0x1F)<<16 | int(buf[0])<<8 | int(buf[1]), nil
	case b0&0xF0 == 0xE0:
		buf := make([]byte, 3)
		if _, err := io.ReadFull(r, buf); err != nil {
			return 0, err
		}
		return int(b0&0x0F)<<24 | int(buf[0])<<16 | int(buf[1])<<8 | int(buf[2]), nil
	default: // 0xF0 prefix -> 4 byte length menyusul
		buf := make([]byte, 4)
		if _, err := io.ReadFull(r, buf); err != nil {
			return 0, err
		}
		return int(buf[0])<<24 | int(buf[1])<<16 | int(buf[2])<<8 | int(buf[3]), nil
	}
}

// readSentence membaca satu sentence penuh (slice of words) sampai word kosong.
func readSentence(r *bufio.Reader) ([]string, error) {
	var words []string
	for {
		length, err := readLength(r)
		if err != nil {
			return nil, err
		}
		if length == 0 {
			return words, nil // penutup sentence
		}
		buf := make([]byte, length)
		if _, err := io.ReadFull(r, buf); err != nil {
			return nil, err
		}
		words = append(words, string(buf))
	}
}

func main() {
	host, user, password := "127.0.0.1:8728", "admin", "123"

	conn, err := net.Dial("tcp", host)
	if err != nil {
		log.Fatalf("gagal konek: %v", err)
	}
	defer conn.Close()
	fmt.Println("TCP tersambung ke", host)

	w := bufio.NewWriter(conn)
	r := bufio.NewReader(conn)

	// --- Login: RouterOS >= 6.43 pakai plain login satu langkah ---
	if err := writeSentence(w, "/login", "=name="+user, "=password="+password); err != nil {
		log.Fatal(err)
	}
	fmt.Println("Sentence /login terkirim, menunggu balasan...")
	sentence, err := readSentence(r)
	if err != nil {
		log.Fatalf("tidak ada balasan dari router (%v) — kemungkinan besar service API "+
			"belum aktif, IP kamu diblok oleh allowed-address, atau device di %s bukan RouterOS", err, host)
	}
	fmt.Println("Balasan login:", sentence)

	// RouterOS lama (<6.43) membalas dengan challenge "=ret=..." yang perlu
	// digabung dengan password lewat MD5 sebelum login diterima.
	if challenge, ok := findWord(sentence, "ret"); ok {
		challengeBytes, _ := hex.DecodeString(challenge)
		h := md5.New()
		h.Write([]byte{0})
		h.Write([]byte(password))
		h.Write(challengeBytes)
		response := "00" + hex.EncodeToString(h.Sum(nil))

		if err := writeSentence(w, "/login", "=name="+user, "=response="+response); err != nil {
			log.Fatal(err)
		}
		if _, err := readSentence(r); err != nil {
			log.Fatal(err)
		}
	}
	fmt.Println("Login berhasil")

	// --- Jalankan perintah: /system/identity/print, hasil jadi []map[string]string ---
	rows, err := runCommand(w, r, "/system/clock/prints")
	if err != nil {
		log.Fatal(err)
	}
	// for _, row := range rows {
	// 	fmt.Println("Identity:", row)
	// }
	fmt.Println(rows[0]["date"])

	// Contoh lain — /interface/print bakal ngasih banyak baris, masing-masing map:
	// rows, err = runCommand(w, r, "/interface/print")
	// for _, row := range rows {
	// 	fmt.Println(row["name"], row["type"], row["running"])
	// }
}

// wordsToMap mengubah word-word "=key=value" dalam satu sentence (mis. hasil
// dari !re) menjadi map[string]string — key pertama ("!re", ".tag", dst
// yang tidak diawali "=") otomatis dilewati.
func wordsToMap(words []string) map[string]string {
	m := make(map[string]string)
	for _, w := range words {
		if len(w) == 0 || w[0] != '=' {
			continue
		}
		rest := w[1:]
		eq := indexByte(rest, '=')
		if eq == -1 {
			continue
		}
		m[rest[:eq]] = rest[eq+1:]
	}
	return m
}

func indexByte(s string, c byte) int {
	for i := 0; i < len(s); i++ {
		if s[i] == c {
			return i
		}
	}
	return -1
}

// runCommand mengirim sentence perintah lalu mengumpulkan setiap balasan
// "!re" menjadi map, berhenti begitu ketemu "!done". Mengembalikan error
// kalau router membalas "!trap".
func runCommand(w *bufio.Writer, r *bufio.Reader, words ...string) ([]map[string]string, error) {
	if err := writeSentence(w, words...); err != nil {
		return nil, err
	}

	var results []map[string]string
	for {
		sentence, err := readSentence(r)
		if err != nil {
			return nil, err
		}
		if len(sentence) == 0 {
			continue
		}
		switch sentence[0] {
		case "!re":
			results = append(results, wordsToMap(sentence[1:]))
		case "!done":
			return results, nil
		case "!trap":
			errMap := wordsToMap(sentence[1:])
			return nil, fmt.Errorf("router error: %s", errMap["message"])
		}
	}
}
func findWord(words []string, key string) (string, bool) {
	prefix := "=" + key + "="
	for _, w := range words {
		if len(w) > len(prefix) && w[:len(prefix)] == prefix {
			return w[len(prefix):], true
		}
	}
	return "", false
}
