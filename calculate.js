////////////////////////////////  CONSTANTS  ////////////////////////////////
const FANCY_OUTPUT = !process.argv.some((arg) => arg.trim() === "-q");

const STDIN = 0;

// Credit to https://github.com/sergei1152/WhatsMyGPA for the format and values.
const STANDARD_GPA_SCALE = [
  {
    value: 4,
    min: 90,
    max: 100,
  },
  {
    value: 3.9,
    min: 85,
    max: 89,
  },
  {
    value: 3.7,
    min: 80,
    max: 84,
  },
  {
    value: 3.3,
    min: 77,
    max: 79,
  },
  {
    value: 3,
    min: 73,
    max: 76,
  },
  {
    value: 2.7,
    min: 70,
    max: 72,
  },
  {
    value: 2.3,
    min: 67,
    max: 69,
  },
  {
    value: 2,
    min: 63,
    max: 66,
  },
  {
    value: 1.7,
    min: 60,
    max: 62,
  },
  {
    value: 1.3,
    min: 57,
    max: 59,
  },
  {
    value: 1,
    min: 53,
    max: 56,
  },
  {
    value: 0.7,
    min: 50,
    max: 52,
  },
  {
    value: 0,
    min: 0,
    max: 49,
  },
];

////////////////////////////////   HELPERS   ////////////////////////////////
const dump = (x) => (typeof x === "string" ? x : JSON.stringify(x, null, 2));
const log = FANCY_OUTPUT
  ? (prefix, data = "", suffix = "") =>
      console.log(
        `${data ? prefix : dump(prefix)}${data ? " " + dump(data) : ""}${
          suffix ? " " + suffix : ""
        }`
      )
  : (prefix, data) => console.log(dump(data || prefix));
const bisectRight = (arr, x) => {
  let min = 0;
  let max = arr.length;
  while (min < max) {
    const cur = min + ((max - min) >> 1);
    if (x >= arr[cur]) {
      max = cur;
    } else {
      min = cur + 1;
    }
  }
  return min;
};
const lookupGPA = (scale) => {
  const mins = scale.map(({ min }) => min);
  return (grade) => {
    if (grade == null || isNaN(grade)) return grade;
    const pos = bisectRight(mins, grade);
    if (pos == -1) return grade;
    return scale[pos].value;
  };
};
const lookupStandardGPA = lookupGPA(STANDARD_GPA_SCALE);
const computeAverageGrade = (courses) => {
  const coursesWithNumericGrades = courses.filter(
    ({ grade }) => !(grade == null || isNaN(grade))
  );
  const totalCreditEarned = coursesWithNumericGrades.reduce(
    (rror, { creditEarned }) => rror + creditEarned,
    0
  );
  return (
    coursesWithNumericGrades.reduce(
      (rror, { grade, creditEarned }) => rror + grade * creditEarned,
      0
    ) / totalCreditEarned
  );
};

////////////////////////////////   IMPORTS   ////////////////////////////////
import fs from "fs";

//////////////////////////////// CALCULATION ////////////////////////////////
const transcript = fs.readFileSync(STDIN, "utf-8");
const [, coursesString] = transcript.split("---\n");
let terms = null;
try {
  terms = JSON.parse(coursesString);
} catch {
  console.error("Failed to parse transcript, aborting...");
  process.exit();
}

const courses = terms.map(({ courses }) => courses).flat();
const CAV = computeAverageGrade(courses);
const coursesWithGPAs = courses.map(({ grade, ...rest }) => ({
  grade: lookupStandardGPA(grade),
  ...rest,
}));
const cGPA = computeAverageGrade(coursesWithGPAs);

////////////////////////////////   LOGGING   ////////////////////////////////
log("CAV: ", CAV);
log("cGPA: ", cGPA);
