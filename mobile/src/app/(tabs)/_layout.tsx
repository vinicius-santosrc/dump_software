import AppTabs from '@/components/app-tabs';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
    return (
        <>
            <AppTabs />
            <StatusBar style="auto" />
        </>
    );
}
