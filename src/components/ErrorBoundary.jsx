import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex items-center justify-center bg-slate-50 font-sans px-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-10 max-w-sm w-full flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-800 mb-1">Đã xảy ra lỗi</h1>
              <p className="text-sm text-slate-500">
                Trang này gặp sự cố. Thử tải lại hoặc quay về trang khác.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => this.setState({ error: null })}
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-3 transition"
              >
                Thử lại
              </button>
              <a
                href="/"
                className="w-full rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold py-3 transition text-center"
              >
                Về trang chủ
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
