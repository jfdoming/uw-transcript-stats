///////////////////////////////// CONSTANTS /////////////////////////////////
const FANCY_OUTPUT = !process.argv.some((arg) => arg.trim() === "-q");

const STDIN = 0;
const HEADER_DELIMITER = "Beginning of Undergraduate Record";
const FOOTER_DELIMITER = "Milestones";
const STUDENT_ID_REGEX = /Student ID: (\d{8,})/g;
const TERM_NAME_REGEX = /(Fall|Winter|Spring) \d{4,}/g;
const TERM_SEASONS = {
  Fall: "f",
  Winter: "w",
  Spring: "s",
};
const COURSE_HEADER_SANITY_CHECK = "Course Description Attempted Earned Grade";
const GPA_HEADER = "In GPA Earned";
const COURSE_REGEX = /([A-Z]{2,}) (\d{1,3}\w?)/g;
const CREDIT_REGEX = /(\d+\.\d+) (\d+\.\d+)(?: (\d+|[A-Z]+))?/g;

/////////////////////////////////  HELPERS  /////////////////////////////////
const dump = (x) => (typeof x === "string" ? x : JSON.stringify(x, null, 2));
const log = FANCY_OUTPUT
  ? (prefix, data = "", suffix = "") =>
      console.log(
        `${data ? prefix : dump(prefix)}${data ? " " + dump(data) : ""}${
          suffix ? " " + suffix : ""
        }`
      )
  : (prefix, data) => console.log(dump(data || prefix));
const getByHeader = (regex, data) => {
  const segmentRegex = new RegExp(
    regex.source + "(?:(?: [^ ]*?)*?)(?= " + regex.source + "|$)",
    "g"
  );
  const segments = Array.from(data.matchAll(segmentRegex));
  return segments.map((segmentMatch) => segmentMatch[0].trim());
};
const optNumber = (x) => (isNaN(x) ? x : Number(x));

/////////////////////////////////  IMPORTS  /////////////////////////////////
import fs from "fs";

/////////////////////////////////  PARSING  /////////////////////////////////
const transcript = fs.readFileSync(STDIN, "utf-8");
const transcriptTokens = transcript.replace(/\s+/g, " ");
const [header, text] = transcriptTokens.split(HEADER_DELIMITER);
const [body, footer] = transcriptTokens.split(FOOTER_DELIMITER);

if (!body.includes(COURSE_HEADER_SANITY_CHECK)) {
  console.error(
    "Error: Course grade format has changed! Please update this script."
  );
  process.exit();
}

// Parse the header.
const [[, studentID]] = header.matchAll(STUDENT_ID_REGEX);

// Parse terms out of the body.
const termEntries = getByHeader(TERM_NAME_REGEX, body);

// Process terms.
const terms = termEntries.map((entry) => {
  const [termHeader, rest] = entry.split(COURSE_HEADER_SANITY_CHECK);
  const [termBody, termFooter] = rest.split(GPA_HEADER);

  // Process term date.
  const [termDate] = termHeader.match(TERM_NAME_REGEX);
  const [termSeasonFull, termYearString] = termDate.split(" ");
  const termSeason = TERM_SEASONS[termSeasonFull];
  const termYear = optNumber(termYearString.slice(2));

  // Process courses and grades.
  const courseEntries = getByHeader(COURSE_REGEX, termBody);
  const courses = courseEntries.map((course) => {
    const [[, subject, code]] = course.matchAll(COURSE_REGEX);
    const [, creditValueString, creditEarnedString, gradeString] =
      Array.from(course.matchAll(CREDIT_REGEX))[0] ?? [];
    return {
      subject,
      code,
      creditValue: optNumber(creditValueString),
      creditEarned: optNumber(creditEarnedString),
      grade: optNumber(gradeString),
    };
  });

  return {
    season: termSeason,
    year: termYear,
    courses,
  };
});

/////////////////////////////////  LOGGING  /////////////////////////////////
log("Student ID:", studentID);
log("---");
log(terms);
