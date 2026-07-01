import { useGlobal } from "@/context/GlobalProvider";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MyStorieCard } from "./stories/storie";

const Stories = () => {
    return (
        <View style={styles.containerFlexStory}>
            <MyStorieCard />
        </View >

    )
}

const styles = StyleSheet.create({
    containerFlexStory: {
        display: 'flex',
        flexDirection: 'row',
        padding: 12
    }
})

export default Stories;