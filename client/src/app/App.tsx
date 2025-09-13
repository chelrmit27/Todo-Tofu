import AppRouter from './Router';
import Provider from './Provider';
const App = () => {
  return (
    <Provider>
      <AppRouter />
    </Provider>
  );
};

export default App;
