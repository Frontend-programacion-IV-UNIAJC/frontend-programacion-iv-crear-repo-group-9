# frontend-programacion-iv-Etiqueta-Clara

# Andrea Valentina Ochoa usuario 1

# Andres Felipe Velez Usuario 2 

## Mapeo de campos de la API
 
| campo de su tarjeta | campo de la API | cómo se obtiene |
| :--- | :--- | :--- |
| ID / Ruta detalle | `code` / `_id` | directo |
| Nombre del producto | `product_name_es` / `product_name` | traducido |
| Marca | `brands` | directo |
| Imagen | `image_front_url` / `image_url` | directo |
| Calorías (kcal) | `nutriments.energy-kcal_100g` | estimado |
| Azúcares (g) | `nutriments.sugars_100g` | directo |
| Grasas saturadas (g) | `nutriments.saturated-fat_100g` | directo |
| Sodio / Sal (g) | `nutriments.salt_100g` | traducido |
| Alérgenos | `allergens_tags` | traducido |
| Sellos / Etiquetas | `nutriscore_grade` / `nova_group` | estimado |
