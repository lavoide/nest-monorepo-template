import ExploreContainer from '../components/explore-container'
import { ThemeToggle } from '@/components/theme-toggle'

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">Trainbook</h1>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <ExploreContainer />
      </main>
    </div>
  )
}

export default Home
