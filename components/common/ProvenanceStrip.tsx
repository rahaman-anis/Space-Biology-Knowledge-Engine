export interface ProvenanceProps {
  pmcid?: string
  ntrsId?: string
  taskbookId?: string
  osdrIds?: string[]
  dense?: boolean
  titleHint?: string
  showSourceBadges?: boolean
}

const BadgeBox = ({ label, href }: { label: string; href?: string }) =>
  href ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-800 hover:underline focus-visible:ring-2 focus-visible:ring-primary-300"
    >
      {label}
    </a>
  ) : (
    <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">{label}</span>
  )

export default function ProvenanceStrip(p: ProvenanceProps) {
  const { pmcid, ntrsId, taskbookId, osdrIds, dense = false, titleHint, showSourceBadges = true } = p
  const cls = dense ? "text-xs" : "text-sm"
  return (
    <div className={`flex flex-wrap items-center gap-3 ${cls} text-gray-700 border-t border-gray-200 pt-3`}>
      {showSourceBadges && (
        <>
          {pmcid && <BadgeBox label="PMC" href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}`} />}
          {ntrsId && <BadgeBox label="NTRS" href={`https://ntrs.nasa.gov/citations/${ntrsId}`} />}
          {osdrIds?.length ? <BadgeBox label="OSDR" href="https://osdr.nasa.gov" /> : null}
          {taskbookId && <BadgeBox label="Task Book" href="https://taskbook.nasaprs.com/" />}
        </>
      )}
      {pmcid && (
        <a
          href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcid}`}
          className="hover:underline mono focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
          title={titleHint}
          aria-label={`Open PMCID ${pmcid}`}
          target="_blank"
          rel="noreferrer"
        >
          {pmcid}
        </a>
      )}
      {ntrsId && (
        <a
          href={`https://ntrs.nasa.gov/citations/${ntrsId}`}
          className="hover:underline mono focus-visible:ring-2 focus-visible:ring-primary-300 rounded px-1"
          aria-label={`Open NTRS ${ntrsId}`}
          target="_blank"
          rel="noreferrer"
        >
          {ntrsId}
        </a>
      )}
      {taskbookId && (
        <span className="mono" aria-label={`Taskbook ${taskbookId}`}>
          {taskbookId}
        </span>
      )}
      {osdrIds?.length ? (
        <span className="mono" aria-label="OSDR identifiers">
          {osdrIds.join(", ")}
        </span>
      ) : null}
    </div>
  )
}
