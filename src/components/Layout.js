import { View } from 'react-native';

const Layout = ({ children }) => {
  return <View className='flex-1 bg-white px-3 items-center'>{children}</View>;
};

export default Layout;
