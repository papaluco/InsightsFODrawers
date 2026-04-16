import { BrowserRouter } from 'react-router-dom';
import RoutesProvider from './components/Common/RoutesProvider';


const App = () => {
  return (
    <BrowserRouter>
      {/* Removed ErrorBoundary and ToastContainer since they are missing */}
      <RoutesProvider />
    </BrowserRouter>
  );
};

export default App;