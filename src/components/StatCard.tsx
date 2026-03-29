interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subValue?: string;
}

export function StatCard({ label, value, icon, subValue }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-lg font-semibold text-gray-900 truncate">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}
