:put (",'.$expmode.',' . $price . ',' . $validity . ','.$sprice.',,' . $getlock . ',"); 
{
  :local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; 
  :local ucode [:pic $comment 0 2]; 
  :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ 
    :local date [ /system clock get date ];
    :local year [ :pick $date 7 11 ];
    :local month [ :pick $date 0 3 ]; 
    /sys sch add name="$user" disable=no start-date=$date interval="' . $validity . '"; 
    :delay 5s; 
    :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; 
    :local getxp [len $exp]; 
    :if ($getxp = 15) do={ 
      :local d [:pic $exp 0 6]; 
      :local t [:pic $exp 7 16]; 
      :local s ("/"); 
      :local exp ("$d$s$year $t"); 
      /ip hotspot user set comment="$exp" [find where name="$user"];
    }; 
    :if ($getxp = 8) do={ 
      /ip hotspot user set comment="$date $exp" [find where name="$user"];
    }; 
    :if ($getxp > 15) do={ 
      /ip hotspot user set comment="$exp" [find where name="$user"];
    };
    :delay 5s; 
    /sys sch remove [find where name="$user"]
    
    ; :local mac $"mac-address"; 
    :local time [/system clock get time ]; 
    /system script add name="$date-|-$time-|-$user-|-'.$price.'-|-$address-|-$mac-|-' . $validity . '-|-'.$name.'-|-$comment" owner="$month$year" source="$date" comment="mikhmon"
  }
}
#     ; [:local mac $"mac-address"; /ip hotspot user set mac-address=$mac [find where name=$user]] 
#   }
# }

# bg service
:local dateint do={
  :local montharray ( "jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec" );
  :local days [ :pick $d 4 6 ];
  :local month [ :pick $d 0 3 ];
  :local year [ :pick $d 7 11 ];
  :local monthint ([ :find $montharray $month]);
  :local month ($monthint + 1);
  :if ( [len $month] = 1) do={
    :local zero ("0");
    :return [:tonum ("$year$zero$month$days")];
  } else={
    :return [:tonum ("$year$month$days")];
  }
}; 
:local timeint do={ 
  :local hours [ :pick $t 0 2 ]; 
  :local minutes [ :pick $t 3 5 ]; 
  :return ($hours * 60 + $minutes) ; 
}; 
:local date [ /system clock get date ]; 
:local time [ /system clock get time ]; 
:local today [$dateint d=$date]; 
:local curtime [$timeint t=$time]; 
:foreach i in [ /ip hotspot user find where profile="'.$name.'" ] do={ 
  :local comment [ /ip hotspot user get $i comment]; 
  :local name [ /ip hotspot user get $i name]; 
  :local gettime [:pic $comment 12 20]; 
  :if ([:pic $comment 3] = "/" and [:pic $comment 6] = "/") do={
    :local expd [$dateint d=$comment]; 
    :local expt [$timeint t=$gettime]; 
    :if (($expd < $today and $expt < $curtime) or ($expd < $today and $expt > $curtime) or ($expd = $today and $expt < $curtime)) do={ 
      [ /ip hotspot user '.$mode.' $i ]; 
      [ /ip hotspot active remove [find where user=$name] ];
    }
  }
}