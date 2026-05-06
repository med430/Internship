import { Brain, Clock, Play, Trophy, Users, Zap } from "lucide-react";
import { PersonaSelector } from "@/components/virtual-interviewer/persona-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SetupCardProps {
  isStarting: boolean;
  onStartInterview: () => void;
}

export function SetupCard({ isStarting, onStartInterview }: SetupCardProps) {
  return (
    <Card className="p-8 md:p-12 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-purple-500/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
          <Zap className="h-10 w-10 text-purple-600 dark:text-purple-400" />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
            Ready for Your Interview?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            Experience a realistic interview with our AI-powered system. Each
            session is unique, adaptive, and designed to help you improve.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 py-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                AI Persona System
              </h3>
              <p className="text-xs text-muted-foreground">
                Interview with AI personas featuring unique roles, styles, and
                difficulty levels
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-blue-500/10 shrink-0">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Conversational Agent
              </h3>
              <p className="text-xs text-muted-foreground">
                Real-time bidirectional communication with an intelligent
                interview agent
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-cyan-500/10 shrink-0">
              <Clock className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Smart Interview Flow
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatic interview conclusion based on message count and
                conversation context
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 text-left">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0">
              <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Comprehensive Analysis
              </h3>
              <p className="text-xs text-muted-foreground">
                Detailed feedback reports automatically saved to your interview
                history
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <PersonaSelector />
        </div>

        <div className="pt-6">
          <Button
            onClick={onStartInterview}
            disabled={isStarting}
            size="lg"
            className="h-12 px-8 text-base font-semibold rounded-xl shadow-2xl shadow-purple-500/30 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                Preparing Interview...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start Interview Now
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            No preparation needed • Guided live interview flow • Auto-saved
            feedback
          </p>
        </div>
      </div>
    </Card>
  );
}
