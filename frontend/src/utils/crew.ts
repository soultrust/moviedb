export interface CrewMemberRow {
  id: number;
  name: string;
  job: string;
}

/** Directors first (Director, then Co-Director), then remaining crew sorted by job then name. */
export function sortCrewWithDirectorsFirst(crew: CrewMemberRow[]): CrewMemberRow[] {
  const isDirectorJob = (job: string) =>
    job === "Director" || job === "Co-Director";

  const directors = crew
    .filter((c) => isDirectorJob(c.job))
    .sort((a, b) => a.job.localeCompare(b.job) || a.name.localeCompare(b.name));

  const rest = crew
    .filter((c) => !isDirectorJob(c.job))
    .sort((a, b) => a.job.localeCompare(b.job) || a.name.localeCompare(b.name));

  return [...directors, ...rest];
}
