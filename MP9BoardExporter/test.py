def parse_json(json_string):
    def parse_object(obj_string):
        obj = {}
        pairs = split_pairs(obj_string)
        
        for pair in pairs:
            key, value = parse_pair(pair)
            obj[key] = value
        
        return obj


    def parse_array(arr_string):
        arr = []
        items = split_items(arr_string)
        
        for item in items:
            arr.append(parse_value(item.strip()))
        
        return arr


    def split_pairs(obj_string):
        pairs = []
        bracket_count = 0
        current_pair = []
        
        for char in obj_string:
            if char == '{':
                bracket_count += 1
            elif char == '}':
                bracket_count -= 1
            elif char == ',' and bracket_count == 0:
                pairs.append(''.join(current_pair).strip())
                current_pair = []
                continue
            
            current_pair.append(char)
        
        if current_pair:
            pairs.append(''.join(current_pair).strip())
        
        return pairs


    def split_items(arr_string):
        items = []
        bracket_count = 0
        current_item = []
        
        for char in arr_string:
            if char == '[':
                bracket_count += 1
            elif char == ']':
                bracket_count -= 1
            elif char == ',' and bracket_count == 0:
                items.append(''.join(current_item).strip())
                current_item = []
                continue
            
            current_item.append(char)
        
        if current_item:
            items.append(''.join(current_item).strip())
        
        return items


    def parse_pair(pair_string):
        key, value = pair_string.split(':', 1)
        key = key.strip().strip('"')
        value = parse_value(value.strip())
        return key, value


    def parse_value(value_string):
        value_string = value_string.strip()
        
        if value_string.startswith('"') and value_string.endswith('"'):
            return value_string[1:-1]
        elif value_string.isdigit():
            return int(value_string)
        elif value_string == 'true':
            return True
        elif value_string == 'false':
            return False
        elif value_string == 'null':
            return None
        elif value_string.startswith('{') and value_string.endswith('}'):
            return parse_object(value_string)
        elif value_string.startswith('[') and value_string.endswith(']'):
            return parse_array(value_string)
        else:
            raise ValueError("Invalid value format")

    json_string = json_string.strip()

    if json_string.startswith('{') and json_string.endswith('}'):
        return parse_object(json_string[1:-1].strip())
    elif json_string.startswith('[') and json_string.endswith(']'):
        return parse_array(json_string[1:-1].strip())
    else:
        raise ValueError("Invalid JSON format")

    
print(parse_json("{'a': 0, 'b' : [1,2,4,5]}"))