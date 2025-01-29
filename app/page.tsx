import DeployButton from "../components/DeployButton";
import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import HeroButtons from "../components/HeroButtons";

export default async function Index() {
  // const canInitSupabaseClient = () => {
  //   // This function is just for the interactive tutorial.
  //   // Feel free to remove it once you have Supabase connected.
  //   try {
  //     createClient();
  //     return true;
  //   } catch (e) {
  //     return false;
  //   }
  // };

  // const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <DeployButton />
          {/* {isSupabaseConnected && <AuthButton />} */}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold mb-6">Transform Your Videos with AI</h1>
        <p className="text-xl text-gray-600 mb-8">
          Powerful video processing tools powered by artificial intelligence
        </p>
        {/* <HeroButtons isSupabaseConnected={isSupabaseConnected} /> */}
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 rounded-lg border border-foreground/10">
          <h3 className="text-xl font-semibold mb-3">Video Processing</h3>
          <p className="text-gray-600">
            Process and analyze your videos with advanced AI algorithms
          </p>
        </div>
        <div className="text-center p-6 rounded-lg border border-foreground/10">
          <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
          <p className="text-gray-600">
            Your videos are stored securely with enterprise-grade encryption
          </p>
        </div>
        <div className="text-center p-6 rounded-lg border border-foreground/10">
          <h3 className="text-xl font-semibold mb-3">Real-time Analysis</h3>
          <p className="text-gray-600">
            Get instant insights and processing results in real-time
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold mb-2">1</div>
            <h3 className="text-xl font-semibold mb-2">Upload</h3>
            <p className="text-gray-600">Upload your video file securely</p>
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">2</div>
            <h3 className="text-xl font-semibold mb-2">Process</h3>
            <p className="text-gray-600">Our AI analyzes your video content</p>
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">3</div>
            <h3 className="text-xl font-semibold mb-2">Results</h3>
            <p className="text-gray-600">Get your processed video and insights</p>
          </div>
        </div>
      </div>

      <footer className="w-full border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Powered by{" "}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Supabase
          </a>
        </p>
      </footer>
    </div>
  );
}
