import sys
import os

def get_all_js_files(directory):
    """Récupère tous les fichiers .js d'un dossier et de ses sous-dossiers, sauf startup.js."""
    js_file_paths = []
    startup_file = None
    for root, _, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            if file == 'startup.js':
                startup_file = file_path
            elif file.endswith('.js'):
                js_file_paths.append(file_path)
    return js_file_paths, startup_file

def load_file(file_name):
    """Charge un fichier en tant que texte brut."""
    with open(file_name, 'r') as f:
        return f.read()

def combine_files(config_content, js_files, startup_file, check_configuration, is_javascript_environnement):
    """Combine le contenu d'un fichier de configuration avec une liste de fichiers JavaScript."""
    combined_content = ""
    for file in js_files:
        file_content = load_file(file)
        if combined_content != "":
            combined_content += "\n"
        combined_content += file_content
        
    if startup_file:
        combined_content += "\n" + config_content

        startup_content = load_file(startup_file)
        if is_javascript_environnement:
            startup_content += "\n" + "for(const log of answer.Logs){switch(log.Type){case 'error':console.error(log.Message);break;case 'warning':console.warn(log.Message);break;case 'log':console.log(log.Message);break;}}console.log(answer);"
        else:
            startup_content += "\n" + "return answer;"

        if check_configuration:
            combined_content += "\nconst checkConfiguration = true;\n" + startup_content
        else:
            combined_content += "\nconst checkConfiguration = false;\n" + startup_content

    return combined_content

def save_file(content, output_file):
    """Enregistre le contenu combiné dans un fichier de sortie."""
    with open(output_file, 'w') as f:
        f.write(content)

def main(config_name, check_configuration = False, is_javascript_environnement = False):
    config_file = f"configs/{config_name}.js"
    core_directory = "core/"
    output_file = "script.js"

    if not os.path.exists(config_file):
        print(f"Le fichier {config_file} n'existe pas.")
        return

    config_content = load_file(config_file)
    js_files, startup_file = get_all_js_files(core_directory)
    combined_content = combine_files(config_content, js_files, startup_file, check_configuration, is_javascript_environnement)

    save_file(combined_content, output_file)
    print(f"Le fichier de configuration combiné a été enregistré sous {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Utilisation: python build.py <config_name> [<check_configuration> <is_javascript_environnement>]")
        sys.exit(1)
    elif len(sys.argv) == 2:
        main(sys.argv[1])
    elif len(sys.argv) == 3:
        main(sys.argv[1], sys.argv[2])
    else:
        main(sys.argv[1], sys.argv[2], sys.argv[3])