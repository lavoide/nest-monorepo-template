import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

const Home: React.FC = () => {
  return (
    <div className="page">
      <header className="header">
        <h1>Trainbook</h1>
      </header>
      <main className="content">
        <ExploreContainer />
      </main>
    </div>
  );
};

export default Home;