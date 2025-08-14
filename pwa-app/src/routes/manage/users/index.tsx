import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Title,
  Button,
  Table,
  ActionIcon,
  Group,
  TextInput,
  Modal,
  Stack
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import { selectUsers, usersSlice } from '@/features/users/usersSlice';
import type { User } from '@/features/users/types';

export const Route = createFileRoute('/manage/users/')({
  component: UsersManagementPage
});

function UsersManagementPage() {
  const users = useAppSelector(selectUsers);
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  // Form for creating/editing users
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      emailAddress: '',
    },
    validate: {
      firstName: (value) => (value.length < 2 ? 'First name must have at least 2 letters' : null),
      lastName: (value) => (value.length < 2 ? 'Last name must have at least 2 letters' : null),
      emailAddress: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    setEditingUser(null);
    form.reset();
    open();
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setValues({
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    });
    open();
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(usersSlice.actions.userRemoved({ id: userId }));
      notifications.show({
        title: 'User Deleted',
        message: 'User has been successfully deleted.',
        color: 'red',
      });
    }
  };

  const handleSubmit = (values: typeof form.values) => {
    if (editingUser) {
      // Update existing user
      dispatch(usersSlice.actions.userUpdated({
        id: editingUser.id,
        ...values,
      }));
      notifications.show({
        title: 'User Updated',
        message: 'User has been successfully updated.',
        color: 'green',
      });
    } else {
      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        ...values,
      };
      dispatch(usersSlice.actions.userAdded(newUser));
      notifications.show({
        title: 'User Created',
        message: 'User has been successfully created.',
        color: 'green',
      });
    }
    close();
    form.reset();
  };

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Users Management</Title>
        <Button leftSection={<IconPlus size={16} />} color="blue" onClick={handleCreateUser}>
          Add User
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search users..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email Address</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredUsers.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>{`${user.firstName} ${user.lastName}`}</Table.Td>
              <Table.Td>{user.emailAddress}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEditUser(user)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Create/Edit User Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="First Name"
              placeholder="Enter first name"
              {...form.getInputProps('firstName')}
              required
            />
            <TextInput
              label="Last Name"
              placeholder="Enter last name"
              {...form.getInputProps('lastName')}
              required
            />
            <TextInput
              label="Email Address"
              placeholder="Enter email address"
              {...form.getInputProps('emailAddress')}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Outlet />
    </Container>
  );
}
