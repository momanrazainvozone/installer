load("@cldr_data//:index.bzl", _ALL_CLDR_LOCALES = "LOCALES")

# List of locales the tool can generate files for.
LOCALES = _ALL_CLDR_LOCALES

# Labels resolving to the individual `generate-locale-tool` entry-points
GENERATE_LOCALES_TOOL_BIN = "//packages/common/locales/generate-locales-tool/bin"
GET_BASE_CURRENCIES_FILE_BIN = "%s:get-base-currencies-file" % GENERATE_LOCALES_TOOL_BIN
GET_BASE_LOCALE_FILE_BIN = "%s:get-base-locale-file" % GENERATE_LOCALES_TOOL_BIN
GET_CLOSURE_LOCALE_FILE_BIN = "%s:get-closure-locale-file" % GENERATE_LOCALES_TOOL_BIN
WRITE_LOCALE_FILES_TO_DIST_BIN = "%s:write-locale-files-to-dist" % GENERATE_LOCALES_TOOL_BIN

def _run_tool_with_single_output(name, output_file, tool, **kwargs):
    native.genrule(
        name = name,
        outs = [output_file],
        srcs = [],
        exec_tools = [tool],
        cmd = """$(location %s) > $@""" % tool,
        **kwargs
    )

def generate_base_currencies_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_BASE_CURRENCIES_FILE_BIN,
        **kwargs
    )

def generate_base_locale_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_BASE_LOCALE_FILE_BIN,
        **kwargs
    )

def generate_closure_locales_file(name, output_file, **kwargs):
    _run_tool_with_single_output(
        name = name,
        output_file = output_file,
        tool = GET_CLOSURE_LOCALE_FILE_BIN,
        **kwargs
    )

def generate_all_locale_files(name, **kwargs):
    locale_files = []

    for locale in LOCALES:
        locale_files += [
            "%s.ts" % locale,
            "global/%s.js" % locale,
            "extra/%s.ts" % locale,
        ]

    native.genrule(
        name = name,
        outs = locale_files,
        srcs = [],
        exec_tools = [WRITE_LOCALE_FILES_TO_DIST_BIN],
        cmd = """$(location %s) $(@D)""" % WRITE_LOCALE_FILES_TO_DIST_BIN,
        **kwargs
    )
