-- First drop all versions of the function
DROP FUNCTION IF EXISTS complete_transformation(UUID, TEXT, BIGINT);
DROP FUNCTION IF EXISTS complete_transformation(INTEGER, TEXT, BIGINT);

-- Then create our new function
CREATE OR REPLACE FUNCTION complete_transformation(
    p_transformation_id INTEGER,
    p_output_path TEXT,
    p_size BIGINT
) RETURNS void AS $$
BEGIN
    -- Update the transformation status
    UPDATE transformations
    SET 
        status = 'completed',
        transformed_path = p_output_path,
        completed_at = NOW(),
        size = p_size
    WHERE id = p_transformation_id;

    -- Update the user's quota
    UPDATE user_quotas
    SET used_bytes = used_bytes + p_size
    FROM transformations t
    WHERE user_quotas.user_id = t.user_id
    AND t.id = p_transformation_id;
END;
$$ LANGUAGE plpgsql; 