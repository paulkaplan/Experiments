var cues = [
  {
    number: 1,
    lightsUp : [
    { channel : 2, startIntensity : 0, delta : 1.5, color : 0x000f0f },
    { channel : 8, startIntensity : 0, delta : 1, color : 0x09f00f },
    ],
    lightsDown : [
      // { channel : 2, intensity : 0 },
      // { channel : 8, intensity : 0 }
    ], 
    upTime : 3, downTime : 0, startAt : 0
  },
  {
    number: 2,
    lightsUp : [
      { channel : 3, startIntensity : 0, delta : 1.5, color : 0x0f000f },
      { channel : 9, startIntensity : 0, delta : 1, color : 0x000fff },
    ],
    lightsDown : [
      // { channel : 2, intensity : 0 },
      // { channel : 8, intensity : 0 }
    ], 
    upTime : 3, downTime : 0, startAt : 2
  },
  {
    number: 3,
    lightsUp : [
      { channel : 2, startIntensity : 1.5, delta : -0.5, color : 0x000f0f  },
      { channel : 8, startIntensity : 1, delta : -0.5, color : 0x09f00f  },
      { channel : 6, startIntensity : 0, delta : 1, color : 0xf000f0 },
      { channel : 1, startIntensity : 0, delta : 1, color : 0x00f0f0 },
      
    ],
    lightsDown : [
      // { channel : 2, intensity : 0 },
      // { channel : 8, intensity : 0 }
    ], 
    upTime : 3, downTime : 0, startAt : 5
  },
  {
    number: 4,
    lightsUp : [
      { channel : 11, startIntensity : 0, delta : 1, color : 0x00ff00 },
      { channel : 10, startIntensity : 0, delta : 1, color : 0x0000ff },
    ],
    lightsDown : [
      // { channel : 2, intensity : 0 },
      // { channel : 8, intensity : 0 }
    ], 
    upTime : 4, downTime : 0, startAt : 8
  },
  { number:5, blackout:true, startAt : 13 },
  {
    number: 6,
    lightsUp : [
      { channel : 0, startIntensity : 0, delta : 1, color : 0x112220 },
      { channel : 1, startIntensity : 0, delta : 1, color : 0x002200 },
      { channel : 2, startIntensity : 0, delta : 1, color : 0xaabb00 },
      { channel : 3, startIntensity : 0, delta : 1, color : 0xf05588 },
      { channel : 4, startIntensity : 0, delta : 1, color : 0xf02255 },
      { channel : 5, startIntensity : 0, delta : 1, color : 0x005511 },
      { channel : 6, startIntensity : 0, delta : 1, color : 0xff0099 },
      { channel : 7, startIntensity : 0, delta : 1, color : 0x0f6611 },
      { channel : 8, startIntensity : 0, delta : 1, color : 0xf02255 },
      { channel : 9, startIntensity : 0, delta : 1, color : 0x00f511 },
      { channel : 10, startIntensity : 0, delta : 1, color : 0x00ff11 },
      { channel : 11, startIntensity : 0, delta : 1, color : 0x0f6611 }
    ],
    lightsDown : [
      // { channel : 2, intensity : 0 },
      // { channel : 8, intensity : 0 }
    ], 
    upTime : 2, downTime : 0, startAt : 15
  }
  
];