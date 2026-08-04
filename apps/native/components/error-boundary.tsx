import { Component, type ErrorInfo, type ReactNode } from "react";
import { Text, View } from "react-native";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center p-6 bg-background">
          <Text className="text-foreground text-lg font-semibold mb-2">
            Something went wrong
          </Text>
          <Text className="text-muted text-sm text-center mb-4">
            An unexpected error occurred. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}