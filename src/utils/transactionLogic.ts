export const transactionPath = (
  amount: number,
  user: any,
  editingId: string | null
) => {
  if (amount <= 0 || !user) {
    return 'invalid';
  }

  if (editingId) {
    return 'update';
  }

  return 'add';
};