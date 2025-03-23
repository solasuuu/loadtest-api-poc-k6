export const globals: {
  variable_name: string;
  variables: {
    name: string
    value: any
    path?: string
    from?: string
  }[]
  docker_dir: string
} = {
  variable_name: 'variables',
  variables: [],
  docker_dir: '/k6-script',
}