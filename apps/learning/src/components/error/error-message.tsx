import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  error?: Error | unknown;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = 'エラーが発生しました',
  message,
  error,
  onRetry,
}: ErrorMessageProps) {
  const errorMessage = message || 
    (error instanceof Error ? error.message : 'データの読み込みに失敗しました');

  return (
    <div className="flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-red-900 mb-2">{title}</h3>
            <p className="text-red-700 mb-4">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                再試行
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
