import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">NDPA Toolkit</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Enterprise-grade compliance components for the Nigeria Data Protection Act (NDPA) 2023.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Resources</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/docs" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentation</Link></li>
              <li><Link href="/ndpr-demos" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Interactive Demos</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><a href="https://www.npmjs.com/package/@tantainnovative/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">npm Package</a></li>
              <li><a href="https://github.com/mr-tanta/ndpr-toolkit" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a></li>
            </ul>
          </div>

          {/* Author */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Built by</h4>
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Abraham Esandayinze Tanta</p>
              <ul className="mt-2 space-y-2">
                <li><a href="https://github.com/mr-tanta" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">GitHub</a></li>
                <li><a href="https://linkedin.com/in/mr-tanta" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">LinkedIn</a></li>
                <li><a href="https://tantainnovatives.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tanta Innovative</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Abraham Esandayinze Tanta. MIT License.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Open-source compliance toolkit for Nigerian businesses.
          </p>
        </div>
      </div>
    </footer>
  );
}
