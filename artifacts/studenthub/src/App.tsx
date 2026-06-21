import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";

import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import CreateService from "@/pages/CreateService";
import Missions from "@/pages/Missions";
import MissionDetail from "@/pages/MissionDetail";
import CreateMission from "@/pages/CreateMission";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ProfileEdit from "@/pages/ProfileEdit";
import Messages from "@/pages/Messages";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/services/new" component={CreateService} />
        <Route path="/services/:id" component={ServiceDetail} />
        <Route path="/services" component={Services} />
        <Route path="/missions/new" component={CreateMission} />
        <Route path="/missions/:id" component={MissionDetail} />
        <Route path="/missions" component={Missions} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile/edit" component={ProfileEdit} />
        <Route path="/profile/:id" component={Profile} />
        <Route path="/messages" component={Messages} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
