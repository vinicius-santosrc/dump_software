import {
  Image,
  Pressable,
  StyleSheet,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useGlobal } from '@/context/GlobalProvider';

const TRANSPARENT_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];
  const { user } = useGlobal();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const profileThumbnail = user?.thumbnail;
  const isProfileSelected = pathname.includes('/profile');

  const tabs: {
    name: string;
    label: string;
    mdIcon: string;
    mdIconSelected: string;
    sfIcon: string;
    sfIconSelected: string;
  }[] = [
    {
      name: 'index',
      label: 'Home',
      mdIcon: 'text.rectangle.page',
      mdIconSelected: 'text.rectangle.page.fill',
      sfIcon: 'text.rectangle.page',
      sfIconSelected: 'text.rectangle.page.fill',
    },
    {
      name: 'explore',
      label: 'Search',
      mdIcon: 'safari',
      mdIconSelected: 'safari.fill',
      sfIcon: 'safari',
      sfIconSelected: 'safari.fill',
    },
    {
      name: 'inbox',
      label: 'Direct',
      mdIcon: 'paperplane',
      mdIconSelected: 'paperplane.fill',
      sfIcon: 'paperplane',
      sfIconSelected: 'paperplane.fill',
    },
    {
      name: 'dumps',
      label: 'Dumps',
      mdIcon: 'play.square',
      mdIconSelected: 'play.square.fill',
      sfIcon: 'play.square',
      sfIconSelected: 'play.square.fill',
    },
    {
      name: 'profile',
      label: 'Profile',
      mdIcon: 'person',
      mdIconSelected: 'person.fill',
      sfIcon: 'person',
      sfIconSelected: 'person.fill',
    },
  ];

  const profileTabIndex = tabs.findIndex((tab) => tab.name === 'profile');
  const tabWidth = width / tabs.length;
  const profileOverlayLeft = tabWidth * profileTabIndex;
  const profileOverlayBottom = Math.max(insets.bottom, 0) + 10;
  const shouldRenderProfileOverlay = !!profileThumbnail && profileTabIndex >= 0;

  return (
    <>
      <NativeTabs
        backgroundColor={colors.background}
        indicatorColor={colors.backgroundElement}
        tintColor={colors.text}
        iconColor={'black'}
        labelStyle={{ selected: { color: colors.text } }}
      >
        {tabs.map((tab) => {
          const isProfileTab = tab.name === 'profile';
          const shouldHideNativeProfileIcon = isProfileTab && !!profileThumbnail;

          return (
            <NativeTabs.Trigger name={tab.name} key={tab.name}>
              <Label hidden>{tab.label}</Label>

              {shouldHideNativeProfileIcon ? (
                <Icon
                  src={{
                    default: {
                      uri: TRANSPARENT_ICON,
                      width: 1,
                      height: 1,
                      scale: 1,
                    },
                    selected: {
                      uri: TRANSPARENT_ICON,
                      width: 1,
                      height: 1,
                      scale: 1,
                    },
                  } as any}
                />
              ) : (
                <Icon
                  md={{
                    default: tab.mdIcon,
                    selected: tab.mdIconSelected,
                  } as any}
                  sf={{
                    default: tab.sfIcon,
                    selected: tab.sfIconSelected,
                  } as any}
                />
              )}
            </NativeTabs.Trigger>
          );
        })}
      </NativeTabs>

      {shouldRenderProfileOverlay ? (
        <Pressable
          hitSlop={12}
          onPress={() => router.replace('/(tabs)/profile')}
          style={[
            styles.profileTabOverlay,
            {
              left: profileOverlayLeft,
              bottom: profileOverlayBottom,
              width: tabWidth,
            },
          ]}
        >
          <Image
            source={{ uri: profileThumbnail }}
            style={[
              styles.profileThumbnail,
              isProfileSelected && {
                borderColor: colors.text,
              },
            ]}
          />
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  profileTabOverlay: {
    position: 'absolute',
    height: 18,
    alignItems: 'baseline',
    justifyContent: 'center',
    zIndex: 51,
  },
  profileThumbnail: {
    width: 28,
    height: 28,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#D9D9D9',
  },
});
