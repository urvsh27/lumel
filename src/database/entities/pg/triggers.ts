// update total on is refresh key update
const total_order_trigger = `
CREATE OR REPLACE FUNCTION FUN_updateTotalOnRefresh() 
RETURNS TRIGGER AS $updateTotalOnRefresh_AUDIT$ 
BEGIN 
 
UPDATE public."OrderEntities"
    SET total = (
        SELECT COALESCE(SUM(quantity * price), 0)
        FROM public."OrderDetailsEntities"
        WHERE order_id = NEW.id::TEXT
    )
    WHERE id = NEW.id;

    RETURN NEW; 

END; 

$updateTotalOnRefresh_AUDIT$ LANGUAGE PLPGSQL;

CREATE OR REPLACE TRIGGER updateTotalOnRefresh 
AFTER UPDATE ON PUBLIC."OrderEntities" 
FOR EACH ROW WHEN (OLD."is_refresh" IS DISTINCT FROM NEW."is_refresh") 
EXECUTE FUNCTION FUN_updateTotalOnRefresh();
`;
