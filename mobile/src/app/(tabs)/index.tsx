import Feed from "@/components/feed/feed";
import Header from "@/components/header";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeTab() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <Header />
      <Feed />
    </SafeAreaView>
  );
}