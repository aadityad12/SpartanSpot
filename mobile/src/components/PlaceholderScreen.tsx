import { router } from 'expo-router';
import { View } from 'react-native';
import { AdminHeader, PageHeader, Placeholder, Screen } from './kit';
import { IconButton } from './ui';

// Stand-in body for routes whose real screen is built by a later issue.
export function PlaceholderScreen({
  title,
  issue,
  description,
  admin = false,
  eyebrow,
  back = false,
}: {
  title: string;
  issue: number;
  description: string;
  admin?: boolean;
  eyebrow?: string;
  back?: boolean;
}) {
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return (
    <Screen wide={admin} edges={back ? ['top', 'bottom'] : ['top']}>
      {back ? (
        <View>
          <IconButton name="arrow-left" label="Go back" onPress={goBack} />
        </View>
      ) : null}
      {admin ? <AdminHeader title={title} /> : <PageHeader eyebrow={eyebrow} title={title} />}
      <Placeholder title={title} issue={issue} description={description} />
    </Screen>
  );
}
