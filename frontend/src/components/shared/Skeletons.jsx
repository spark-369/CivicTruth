function SkeletonCard() {
  return (
    <div
      className="p-3 rounded-2xl h-[140px] w-full bg-gray-200 dark:bg-gray-700 animate-pulse"
      aria-hidden="true"
    />
  );
}

function SkeletonTableRow({ columns = 4 }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${i === 0 ? 'w-4/5' : 'w-3/5'}`} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-x-auto" role="status" aria-label="Loading table data">
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-3">
                <div className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${i === 0 ? 'w-2/5' : 'w-1/3'}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonStatCards({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
}

function SkeletonForm({ fields = 3 }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading form">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse w-full" />
      ))}
    </div>
  );
}

function SkeletonAvatar({ width = 48, height = 48 }) {
  return (
    <div
      className="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export { SkeletonCard, SkeletonTable, SkeletonStatCards, SkeletonForm, SkeletonAvatar };