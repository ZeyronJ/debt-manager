import { Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DebtItem = ({ debt, deleteDebt }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      className='flex-row flex-wrap bg-green-800 rounded-lg p-2 mb-3 border'
      onPress={() => {
        navigation.navigate('Debtor', { id: debt.id, debtor: debt.debtor });
      }}
      onLongPress={() => deleteDebt(debt.id)}
      delayLongPress={1000}
    >
      <Text className='text-white w-1/2 font-extrabold text-lg'>
        {debt.debtor}
      </Text>
      <Text className='text-green-400 w-1/2 font-semibold text-lg'>
        ${debt.amount}
      </Text>
      <Text className='text-white w-1/2 text-base'>{debt.thing}</Text>
      <Text className='text-white w-1/2 italic font-thin'>
        {debt.created_at}
      </Text>
    </TouchableOpacity>
  );
};

export default DebtItem;
