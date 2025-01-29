import * as React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Switch, Table } from '@mantine/core';
import { useAppSelector, useAppDispatch } from '@/configureStore';
import { selectDevices } from '@/features/devices/devicesSlice';
import { setDeviceOffline, setDeviceOnline } from '@/features/devices/utils';

export const Route = createFileRoute('/devices/')({
  component: DevicesPage
});

function DevicesPage() {
  const devices = useAppSelector((state) => selectDevices(state));
  const dispatch = useAppDispatch();
  const navigate = useNavigate({ from: '/devices' });

  const handleDeviceClick = (deviceId: string) => {
    navigate({ to: '/devices/$deviceId', params: { deviceId } });
  };

  return (
    <>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>

            <Table.Th>Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Last updated</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {devices.map((device) => (
            <Table.Tr
              key={device.id}
              role="button"
            >
              <Table.Td
                onClick={() => handleDeviceClick(device.id)}
              >{device.name}</Table.Td>
              <Table.Td
                onClick={() => handleDeviceClick(device.id)}
              >{device.type}</Table.Td>
              <Table.Td>
                <Switch
                  {...(device.status === 'online'
                    ? {
                      checked: true,
                      onChange: () =>
                        setDeviceOffline({ deviceId: device.id })(dispatch)
                    }
                    : {
                      checked: false,
                      onChange: () =>
                        setDeviceOnline({ deviceId: device.id })(dispatch)
                    })}
                />
              </Table.Td>
              <Table.Td
                onClick={() => handleDeviceClick(device.id)}
              >{device.lastUpdated?.toLocaleString('nl-NL')}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
