export default function Home(): JSX.Element {
  return (
    <div>
      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-6xl font-bold text-center">
          Welcome to <span className="text-blue-600">Collaboration</span>
        </h1>
        <p className="mt-3 text-2xl text-center">
          Automatically play videos on your educational websites
        </p>
      </main>
    </div>
  );
}
