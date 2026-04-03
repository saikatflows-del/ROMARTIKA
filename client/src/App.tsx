import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GalleryPage from "@/pages/gallery";
import CreateGallery from "@/pages/create-gallery";
import EditGallery from "@/pages/edit-gallery";
import VRGalleryPage from "@/pages/vr-gallery";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery/:id/vr" component={VRGalleryPage} />
      <Route path="/gallery/:id" component={GalleryPage} />
      <Route path="/gallery/:id/edit" component={EditGallery} />
      <Route path="/create" component={CreateGallery} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
