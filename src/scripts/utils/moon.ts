const getJulian = (date: Date) => {
  return ((date.valueOf() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5);
};

const getFrac = (fr: number) => (fr - Math.floor(fr));

const moonDay = (date = new Date()) => {
  const thisJD = getJulian(date);
  const year = date.getFullYear();
  const degToRad = Math.PI / 180;
  let K0, T, T2, T3, J0, F0, M0, M1, B1, oldJ;
  K0 = Math.floor((year - 1900) * 12.3685);
  T = (year - 1899.5) / 100;
  T2 = T * T;
  T3 = T * T * T;
  J0 = 2415020 + 29 * K0;
  F0 = 0.0001178 * T2 - 0.000000155 * T3 + (0.75933 + 0.53058868 * K0) - (0.000837 * T + 0.000335 * T2);
  M0 = 360 * (getFrac(K0 * 0.08084821133)) + 359.2242 - 0.0000333 * T2 - 0.00000347 * T3;
  M1 = 360 * (getFrac(K0 * 0.07171366128)) + 306.0253 + 0.0107306 * T2 + 0.00001236 * T3;
  B1 = 360 * (getFrac(K0 * 0.08519585128)) + 21.2964 - (0.0016528 * T2) - (0.00000239 * T3);
  let phase = 0;
  let jday = 0;
  while (jday < thisJD) {
    let F = F0 + 1.530588 * phase;
    const M5 = (M0 + phase * 29.10535608) * degToRad;
    const M6 = (M1 + phase * 385.81691806) * degToRad;
    const B6 = (B1 + phase * 390.67050646) * degToRad;
    F -= 0.4068 * Math.sin(M6) + (0.1734 - 0.000393 * T) * Math.sin(M5);
    F += 0.0161 * Math.sin(2 * M6) + 0.0104 * Math.sin(2 * B6);
    F -= 0.0074 * Math.sin(M5 - M6) - 0.0051 * Math.sin(M5 + M6);
    F += 0.0021 * Math.sin(2 * M5) + 0.0010 * Math.sin(2 * B6 - M6);
    F += 0.5 / 1440;
    oldJ = jday;
    jday = J0 + 28 * phase + Math.floor(F);
    phase++;
  }

  // 29.53059 days per lunar month
  return (thisJD - oldJ) / 29.53059;
};

const phaseJunk = (phase: number) => {
  let sweep: [number, number] = [0, 0];
  let mag: number;
  // the "sweep-flag" and the direction of movement change every quarter moon
  // zero and one are both new moon; 0.50 is full moon
  if (phase <= 0.25) {
    sweep = [1, 0];
    mag = 20 - 20 * phase * 4
  } else if (phase <= 0.50) {
    sweep = [0, 0];
    mag = 20 * (phase - 0.25) * 4
  } else if (phase <= 0.75) {
    sweep = [1, 1];
    mag = 20 - 20 * (phase - 0.50) * 4
  } else if (phase <= 1) {
    sweep = [0, 1];
    mag = 20 * (phase - 0.75) * 4
  }

  const d = `m100,0 a${mag},20 0 1,${sweep[0]} 0,150 a20,20 0 1,${sweep[1]} 0,-150`;

  return `<pattern id="holes" width="1" height="1"><circle fill="#000" opacity=".3" cx="87" cy="18" r="3"></circle><circle fill="#000" opacity=".3" cx="45" cy="45" r="15"></circle><circle fill="#000" opacity=".3" cx="120" cy="42" r="7.5"></circle><circle fill="#000" opacity=".3" cx="115.5" cy="64.5" r="12"></circle><circle fill="#000" opacity=".3" cx="15" cy="105" r="22.5"></circle><circle fill="#000" opacity=".3" cx="60" cy="120" r="10.5"></circle><circle fill="#000" opacity=".3" cx="112.5" cy="112.5" r="18"></circle></pattern><path d="${d}" /><path d="${d}" fill="url(#holes)"/>`;
};

export const getMoonSVG = (date = new Date()) => {
  return phaseJunk(moonDay(date));
};
