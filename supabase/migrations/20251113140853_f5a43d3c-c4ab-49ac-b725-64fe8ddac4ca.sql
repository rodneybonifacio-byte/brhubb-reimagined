-- Remove the insecure public SELECT policy
DROP POLICY IF EXISTS "Anyone can view roles" ON public.user_roles;

-- Create policy for users to view only their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for admins to view all roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));