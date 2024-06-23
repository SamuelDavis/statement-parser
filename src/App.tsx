import UploadFlow from "./UploadFlow";

function App() {
  return (
    <main>
      <UploadFlow onSubmit={console.log} />
    </main>
  );
}

export default App;
