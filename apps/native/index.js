import { registerPlaybackService } from "react-native-track-player";

import { playbackService } from "@/lib/services/playback-service";

registerPlaybackService(playbackService);

import "expo-router/entry";