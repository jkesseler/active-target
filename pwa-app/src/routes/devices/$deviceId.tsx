import { createFileRoute } from '@tanstack/react-router';
import { Button, Switch, Table } from '@mantine/core';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectDeviceById, deviceOnline, deviceOffline } from '@/features/devices/devicesSlice';
import * as Types from '@/features/devices/types';

export const Route = createFileRoute('/devices/$deviceId')({
  component: DeviceDetailsPage
});

function DeviceDetailsPage() {
  const { deviceId } = Route.useParams();
  const device = useAppSelector((state) => selectDeviceById(state, deviceId));
  const dispatch = useAppDispatch();
  
  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>status</Table.Th>
            <Table.Th>Last updated</Table.Th>
            <Table.Th>Side Effects</Table.Th>
            <Table.Th>Responses</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Table.Tr key={device.id}>
            <Table.Td>{device.name}</Table.Td>
            <Table.Td>{device.type}</Table.Td>
            <Table.Td>
              <Switch
                {...(device.status === Types.STATUS.ONLINE
                  ? {
                    checked: true,
                    onChange: () => dispatch(deviceOffline({ deviceId: device.id }))
                  }
                  : {
                    checked: false,
                    onChange: () => dispatch(deviceOnline({ deviceId: device.id }))
                  })}
              />
            </Table.Td>
            <Table.Td>{device.lastUpdated?.toLocaleString('nl-NL')}</Table.Td>
            <Table.Td>
              Side Effects:
              <Button>Open modal</Button>
            </Table.Td>
            <Table.Td>
              Responses:
              <Button>Open modal</Button>
            </Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </>
  );
}
