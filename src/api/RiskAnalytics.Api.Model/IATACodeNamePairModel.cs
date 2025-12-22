public class IATACodeNamePairModel
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;

    public IATACodeNamePairModel() { }

    public IATACodeNamePairModel(string id, string name)
    {
        Id = id;
        Name = name;
    }
}