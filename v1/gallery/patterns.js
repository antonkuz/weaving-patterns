// Weave pattern data
// pattern: minimal repeating unit (array of 1s and 0s)
// 1 = warp up (black), 0 = weft up (white)
// The pattern repeats horizontally, and each row is offset by its row index for plain weaves

const PATTERNS = [
  {
    name: "2/2",
    pattern: [1, 1, 0, 0]
  },
  {
    name: "1/3",
    pattern: [1,0,0,0]
  },
  {
    name: "2/1+3/2",
    pattern: [1, 1, 0, 1, 1, 1, 0, 0]
  },
  {
    name: "1/3+2/2",
    pattern: [1, 0, 0, 0, 1, 1, 0, 0]
  },
  {
    name: "paradiddle+return",
    pattern: [1,0,1,1,0,1,0,0]
  },
  {
    name: "double paradiddle + return",
    pattern: [1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0]
  },
  {
    name: "(1/1)*2 + 2/2",
    pattern: [1,0,1,0,1,1,0,0]
  },
  {
    name: "(1/1)*2 + paradiddle",
    pattern: [1,0,1,0,1,0,1,1]
  },
  {
    name: "3/1 + 3/1 + 1/1",
    pattern: [1,1,1,0,1,1,1,0,1,0]
  },
  {
    name: "3/3",
    pattern: [1, 1, 1, 0, 0, 0]
  },
  {
    name: "1/2",
    pattern: [1,0,0]
  },
  {
    name: "1/4+1/2",
    pattern: [1,0,0,0,0,1,0,0]
  },
  {
    name: "2/3+2/1",
    pattern: [1,1,0,0,0,1,1,0]
  },
  {
    name: "double paradiddle",
    pattern: [1,0,1,0,1,1]
  },
  {
    name: "double paradiddle",
    pattern: [1,0,1,0,1,1]
  },
  {
    name: "paradiddle diddle",
    pattern: [1,0,1,1,0,0]
  },
  {
    name: "1/1+2/1+2/2",
    pattern: [1,0,1,1,0,1,1,0,0]
  },
  {
    name: "1/2*4+1/1*3",
    pattern: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,1,0,1,0]
  },
  {
    name: "garstka",
    pattern: [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,1,0]
  },
  {
    name: "1/2,1/2,/1/1",
    pattern: [1,0,0,1,0,0,1,0]
  },
  {
    name: "radio1",
    pattern: [1,0,1,0,1,0,1,0,0]
  },
  {
    name: "radio2",
    pattern: [1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1]
  },
  {
    name: "1/1+1/2",
    pattern: [1,0,1,0,0]
  },
  {
    name: "university",
    pattern: [1,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1]
  }
];

