import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="SolenScan" width={20} height={20} className="h-5 w-5" />
            <span className="text-sm font-medium text-gray-700">SolenScan</span>
            <span className="text-xs text-gray-400">Solen Blockchain Explorer</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/blocks" className="hover:text-gray-600">Blocks</Link>
            <Link href="/txs" className="hover:text-gray-600">Transactions</Link>
            <Link href="/events" className="hover:text-gray-600">Events</Link>
            <span>Powered by Solen Network</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
