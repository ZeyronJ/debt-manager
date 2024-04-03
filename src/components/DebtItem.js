import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DebtItem = ({ debt, deleteDebt }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      className='flex-row flex-wrap bg-white rounded-lg p-2 mb-3 shadow shadow-black border border-gray-200'
      onPress={() => {
        navigation.navigate('Debtor', { id: debt.id, debtor: debt.debtor });
      }}
      onLongPress={() => deleteDebt(debt.id)}
      delayLongPress={1000}
    >
      <Text className='text-black/80 w-1/2 font-bold text-lg'>
        {debt.debtor}
      </Text>
      <Text className='text-green-500/80 w-1/2 font-semibold text-lg'>
        ${debt.amount}
      </Text>
      <Text className='text-black/80 w-1/2 text-base'>{debt.thing}</Text>
      <Text className='w-1/2 italic font-light'>{debt.created_at}</Text>
    </TouchableOpacity>
  );
};

export default DebtItem;
