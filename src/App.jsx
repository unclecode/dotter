import DotEffectProcessor from "@/components/DotEffectProcessor";
import "./index.css";

function App() {
  return (
    <div className="dark min-h-screen">
      <div className="bg-background text-foreground">
        <DotEffectProcessor />
      </div>
    </div>
  );
}

export default App;
