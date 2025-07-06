'use client';

export default function Footer() {
  return (
    <footer className="mt-8 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-2">
          {/* リンク */}
          <div className="flex items-center gap-4 text-xs">
            <a
              href="/terms"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              利用規約
            </a>
            <span className="text-gray-400">•</span>
            <a
              href="/privacy"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              プライバシーポリシー
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            © 2025{' '}
            <a
              href="https://studio-spoon.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              STUDIO SPOON
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}