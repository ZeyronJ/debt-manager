import { View } from 'react-native';

const Layout = ({ children }) => {
  return (
    <View className='flex-1 bg-neutral-800 px-2 items-center'>{children}</View>
  );
};

export default Layout;
