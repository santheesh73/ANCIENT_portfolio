const diagrams = [
  "M16 44H62L92 68H165M16 68H165M16 92H62L92 68M129 47V89M148 53V83",
  "M45 93L74 40L109 94L139 44M42 93H142M62 56H123M55 75H128",
  "M90 21L134 48V96L90 120L46 96V48ZM90 21V120M46 48L134 96M134 48L46 96",
  "M47 35H123V89H47ZM56 47H114M56 55H99M56 63H105M63 89V101H135V48H123",
  "M90 68L48 44M90 68L129 43M90 68V101M70 68H110",
  "M45 43H135V99H45ZM45 71H135M74 43V99M104 43V99M45 99L135 43",
  "M40 95V43H140V95ZM40 58H140M61 58V95M115 58V95M69 68H106V85H69Z",
];

export function Concept({ index }: { index: number }) {
  return (
    <svg className="concept" viewBox="0 0 180 138" aria-hidden="true" fill="none">
      <path
        d="M90 5V133M10 69H170M30 22L150 116M150 22L30 116"
        stroke="#7b6a52"
        opacity=".44"
        strokeWidth=".5"
      />
      <circle cx="90" cy="69" r="57" stroke="#7b6a52" strokeDasharray="1 4" />
      <circle cx="90" cy="69" r="53" stroke="#7b6a52" strokeWidth=".4" />
      <path d={diagrams[index]} stroke="#e1b275" strokeWidth="1.4" strokeLinejoin="round" />
      {index === 4 &&
        [
          [48, 44],
          [129, 43],
          [90, 101],
          [90, 68],
        ].map(([x, y]) => <circle key={x + "," + y} cx={x} cy={y} r="11" stroke="#e1b275" />)}
    </svg>
  );
}
