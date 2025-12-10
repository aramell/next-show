import { getShows } from "@/lib/dal";

export default async function Home() {

  const shows = await getShows();
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          Welcome to Next Show
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A modern Next.js application with a beautiful design system.
        </p>
        
        {shows && shows.length > 0 && (
          <div className="mt-8">
            {shows.map((show: any) => (
              <div key={show.id} className="mb-4">
                <h2 className="text-2xl font-semibold">{show.title}</h2>
                <p className="text-muted-foreground">{show.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

