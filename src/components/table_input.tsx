export const TableInput = (props: any) => (
  <td className="p-2 border-b border-base-300">
    <input
      type="number"
      defaultValue={0}
      min={0}
      placeholder="0"
      className="input input-bordered input-sm w-20 max-w-xs text-center bg-base-100 text-base-content border-base-300 font-bold"
      {...props}
    />
  </td>
);
